import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { 
  createProjectRequest, 
  addEquipmentToProjectRequest,
  getOrCreateContactAndPerson,
  getOrCreateLocation,
  normalizeCountry
} from '../../../../lib/rentman';
import { sendQuoteConfirmationEmail } from '../../../../lib/mail';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify that the current user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // 2. Parse request body
    const { submissionId } = await request.json();
    if (!submissionId) {
      return NextResponse.json({ error: 'ID de soumission manquant' }, { status: 400 });
    }

    // 3. Fetch the submission details from Supabase
    const { data: sub, error: subError } = await supabase
      .from('soumissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (subError || !sub) {
      return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 });
    }

    if (sub.rentman_id) {
      return NextResponse.json({ error: 'Cette soumission est déjà synchronisée avec Rentman (ID: ' + sub.rentman_id + ')' }, { status: 400 });
    }

    // 4. Run Rentman Integration Flow
    console.log('[Retry Queue] Starting Rentman sync for submission:', sub.id);
    
    // Parse name parts
    const nameParts = (sub.full_name || '').split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Location';

    // 4a. Get or Create Contact in Rentman
    const { contactId, personId } = await getOrCreateContactAndPerson({
      companyName: sub.company_name,
      firstName,
      lastName,
      email: sub.email,
      phone: sub.phone,
      address: sub.address,
      city: sub.city,
      postalCode: sub.postal_code,
      country: 'ca' // Default country
    });

    // 4b. Ensure Default Location
    const defaultLocationName = "Lieu à confirmer";
    const defaultLocationId = await getOrCreateLocation(defaultLocationName, {});

    // Prepare Notes
    const realLocationNotes = `
[LOGISTIQUE]
Type: ${sub.delivery_method === 'delivery' ? 'Livraison' : "Ramassage à l'entrepôt"}

[LIEU DE L'ÉVÈNEMENT]
Nom: ${sub.location_name || 'N/A'}
Adresse: ${sub.location_address || 'Même que facturation'}
Ville: ${sub.location_city || ''}
Code Postal: ${sub.location_postal_code || ''}
----------------------------------
`;

    // Rentman expects ISO strings with timezone offset
    const tz = '-04:00'; // Default to EDT for Artéfact Urbain

    // 4c. Create project request
    const projectRequestData = {
      name: `Soumission: ${sub.full_name}`,
      linked_contact: contactId ? `/contacts/${contactId}` : null,
      contact_name: sub.company_name || '',
      contact_person_first_name: firstName,
      contact_person_lastname: lastName,
      contact_person_email: sub.email,
      contact_phone: sub.phone || '',
      contact_mailing_street: sub.address || '',
      contact_mailing_city: sub.city || '',
      contact_mailing_postalcode: sub.postal_code || '',
      contact_mailing_country: 'ca',
      location_name: defaultLocationName,
      usageperiod_start: `${sub.start_date}T10:00:00${tz}`,
      usageperiod_end: `${sub.end_date}T18:00:00${tz}`,
      planperiod_start: `${sub.start_date}T10:00:00${tz}`,
      planperiod_end: `${sub.end_date}T18:00:00${tz}`,
      price: sub.total_price || 0,
      remark: realLocationNotes + (sub.event_details || ''),
      language: 'fr',
    };

    const result = await createProjectRequest(projectRequestData);
    const requestId = result.id;

    if (!requestId) {
      throw new Error('Failed to get Request ID from Rentman');
    }

    // 4d. Add items to Project Request
    console.log(`[Retry Queue] Adding items to request ${requestId}...`);
    const equipmentItems: any[] = [];
    let orderIndex = 0;
    
    // items is stored as json/array in database
    const items = Array.isArray(sub.items) ? sub.items : [];

    for (const item of items) {
      equipmentItems.push({
        name: item.name,
        quantity: item.quantity || 1,
        equipmentId: item.id,
        price: item.price || 0,
        order: orderIndex++,
      });

      // Special case: machine option adjustments
      if (item.selectedIngredients && item.selectedFlavours) {
        const flavorDetails = Object.entries(item.selectedFlavours)
          .filter(([_, qty]) => (qty as number) > 0)
          .map(([flavor, qty]) => `${qty}x ${flavor}`)
          .join(', ');

        equipmentItems.push({
          name: `Portions de sirop (${flavorDetails}) pour Machine à slush`,
          quantity: item.quantity || 1,
          price: item.customPriceAdjustment || 0,
          order: orderIndex++,
        });
      }
    }

    await addEquipmentToProjectRequest(requestId, equipmentItems);

    // 4e. Update Supabase with the newly created Rentman project request ID
    const { error: updateErr } = await supabase
      .from('soumissions')
      .update({ 
        rentman_id: String(requestId),
        status: 'pending'
      })
      .eq('id', submissionId);

    if (updateErr) {
      throw new Error('Failed to update submission in database: ' + updateErr.message);
    }

    // 4f. Send confirmation email to the client
    await sendQuoteConfirmationEmail({
      to: sub.email,
      customerName: sub.full_name,
      requestId: String(requestId),
      items: items,
      totalPrice: sub.total_price || 0,
      startDate: sub.start_date,
      endDate: sub.end_date
    }).catch(err => console.error('[Retry Queue Email Error]:', err));

    return NextResponse.json({ 
      success: true, 
      rentman_id: String(requestId),
      message: 'Soumission synchronisée avec succès dans Rentman (ID: ' + requestId + ')'
    });

  } catch (error: any) {
    console.error('[Retry Queue Error]:', error);
    return NextResponse.json({ 
      error: error.message || 'Une erreur est survenue lors de la synchronisation avec Rentman' 
    }, { status: 500 });
  }
}
