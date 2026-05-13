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
    console.log('[Rentman API] Ensuring location exists...', { locationName });
    const rentmanLocationId = await getOrCreateLocation(locationName, {
      street: address, // Defaulting to client address if no specific location address provided
      city,
      postalCode,
      country
    });

    // Rentman expects ISO strings with timezone offset
    const tz = '-04:00'; // Default to EDT for Artéfact Urbain

    // Calculate total price from cart items
    const totalPrice = items.reduce((sum: number, item: any) => 
      sum + ((item.quantity || 1) * (item.price || 0)), 0);

    // 3. Build a COMPLETE project request with LINKED entities
    // Note: Public API only supports 'linked_contact'. 
    // 'linked_location' and 'linked_contact_person' must be connected manually in the UI
    // but having the contact linked already saves a lot of time.
    const projectRequestData = {
      name: `Soumission: ${name}`,

      // Linked Database Entity (Bypasses the "Connect Client" step)
      linked_contact: contactId ? `/contacts/${contactId}` : null,

      // Fallback text info (Populates the left side of the "Connect" screen)
      contact_name: companyName || '',
      contact_person_first_name: firstName || '',
      contact_person_lastname: lastName || '',
      contact_person_email: email,
      contact_phone: phone || '',
      contact_mailing_street: address || '',
      contact_mailing_city: city || '',
      contact_mailing_postalcode: postalCode || '',
      contact_mailing_country: country || 'Canada',

      location_name: locationName || '',

      // Dates
      usageperiod_start: `${startDate}T10:00:00${tz}`,
      usageperiod_end: `${endDate}T18:00:00${tz}`,
      planperiod_start: `${startDate}T10:00:00${tz}`,
      planperiod_end: `${endDate}T18:00:00${tz}`,

      // Price & Details
      price: totalPrice,
      remark: details || '',
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
