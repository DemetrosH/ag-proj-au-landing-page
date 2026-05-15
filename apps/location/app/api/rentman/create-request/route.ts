import { NextResponse } from 'next/server';
import { 
  createProjectRequest, 
  addEquipmentToProjectRequest,
  getOrCreateContactAndPerson,
  getOrCreateLocation
} from '../../../../lib/rentman';
import { sendQuoteConfirmationEmail } from '../../../../lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      startDate, 
      endDate, 
      email, 
      firstName, 
      lastName,
      phone,
      companyName,
      address,
      city,
      postalCode,
      country,
      locationName,
      locationId: providedLocationId, // Extract from body
      items, 
      details 
    } = body;

    if (!name || !startDate || !endDate || !email || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get or Create Contact/Person in Rentman database
    console.log('[Rentman API] Ensuring contact exists...', { email, companyName });
    const { contactId, personId } = await getOrCreateContactAndPerson({
      companyName,
      firstName: firstName || name.split(' ')[0],
      lastName: lastName || name.split(' ').slice(1).join(' ') || 'Client',
      email,
      phone,
      address,
      city,
      postalCode
    });

    // 2. Get or Create Location in Rentman database
    let rentmanLocationId = providedLocationId;
    if (!rentmanLocationId && locationName) {
      console.log('[Rentman API] Ensuring location exists...', { locationName });
      rentmanLocationId = await getOrCreateLocation(locationName, {
        street: body.locationAddress || address,
        city: body.locationCity || city,
        postalCode: body.locationPostalCode || postalCode,
        country: body.locationCountry || country
      });
    }

    // Rentman expects ISO strings with timezone offset
    const tz = '-04:00'; // Default to EDT for Artéfact Urbain

    // Calculate total price from cart items
    const totalPrice = items.reduce((sum: number, item: any) => 
      sum + ((item.quantity || 1) * (item.price || 0)), 0);

    // 3. Ensure a Default Location exists to bypass the "Connect Location" step
    const defaultLocationName = "Lieu à confirmer";
    const defaultLocationId = await getOrCreateLocation(defaultLocationName, {});

    // Move real location info to remarks
    const realLocationNotes = `
[LOGISTIQUE]
Type: ${body.deliveryMethod === 'delivery' ? 'Livraison' : "Ramassage à l'entrepôt"}

[LIEU DE L'ÉVÈNEMENT]
Nom: ${locationName || 'N/A'}
Adresse: ${body.locationAddress || 'Même que facturation'}
Ville: ${body.locationCity || ''}
Code Postal: ${body.locationPostalCode || ''}
----------------------------------
`;

    // 4. Build a COMPLETE project request with LINKED entities
    const projectRequestData = {
      name: `Soumission: ${name}`,

      // Linked Database Entity (Bypasses the "Connect Client" step)
      linked_contact: contactId ? `/contacts/${contactId}` : null,
      
      // Note: linked_location is not supported in the public API, 
      // but setting location_name to an EXACT match often triggers auto-linking.

      // Fallback text info
      contact_name: companyName || '',
      contact_person_first_name: firstName || '',
      contact_person_lastname: lastName || '',
      contact_person_email: email,
      contact_phone: phone || '',
      contact_mailing_street: address || '',
      contact_mailing_city: city || '',
      contact_mailing_postalcode: postalCode || '',
      contact_mailing_country: country || 'Canada',

      // Using the exact name of the default location helps Rentman auto-link
      location_name: defaultLocationName,

      // Dates
      usageperiod_start: `${startDate}T10:00:00${tz}`,
      usageperiod_end: `${endDate}T18:00:00${tz}`,
      planperiod_start: `${startDate}T10:00:00${tz}`,
      planperiod_end: `${endDate}T18:00:00${tz}`,

      // Price & Details
      price: totalPrice,
      remark: realLocationNotes + (details || ''),
      language: 'fr',
    };

    console.log('[Rentman API] Creating linked project request...', { 
      contactId,
      locationName
    });
    
    const result = await createProjectRequest(projectRequestData);
    const requestId = result.id;

    if (!requestId) {
      throw new Error('Failed to get Request ID from Rentman');
    }

    // Add Equipment Items with all fields for clean conversion
    console.log(`[Rentman API] Adding ${items.length} items to request ${requestId}...`);
    const equipmentItems = items.map((item: any, index: number) => ({
      name: item.name,
      quantity: item.quantity || 1,
      equipmentId: item.id,       // Rentman equipment ID
      price: item.price || 0,
      order: index,               // Sort order
    }));

    await addEquipmentToProjectRequest(requestId, equipmentItems);

    const response = NextResponse.json({ 
      success: true, 
      requestId,
      message: 'Rentman project request created successfully' 
    });

    // Send confirmation email in the background (don't await to avoid blocking response)
    sendQuoteConfirmationEmail({
      to: email,
      customerName: name,
      requestId: String(requestId),
      items: items,
      totalPrice: totalPrice,
      startDate: startDate,
      endDate: endDate
    }).catch(err => console.error('[Email Notification Error]:', err));

    return response;

  } catch (error: any) {
    console.error('[Rentman API Error]:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while communicating with Rentman' 
    }, { status: 500 });
  }
}
