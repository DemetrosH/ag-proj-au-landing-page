import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { sendRoleUpdateEmail } from '../../../../lib/mail';

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
    const { targetUserId, targetEmail, newRole, discountFactor } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID utilisateur cible manquant' }, { status: 400 });
    }

    // Prevent self-demotion
    if (targetUserId === user.id && newRole && newRole !== 'admin') {
      return NextResponse.json({ error: 'Vous ne pouvez pas retirer votre propre rôle administrateur.' }, { status: 400 });
    }

    // Fetch the target user's current role to see if it changes (for email notification)
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', targetUserId)
      .single();

    // 3. Prepare updates
    const updates: any = {};
    if (newRole !== undefined) {
      updates.role = newRole;
    }
    if (discountFactor !== undefined) {
      updates.discount_factor = discountFactor;
    }

    // 4. Update profile in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', targetUserId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 5. Send notification email to the user if the role changed
    let emailSent = false;
    if (newRole && targetProfile && targetProfile.role !== newRole && targetEmail) {
      const emailResult = await sendRoleUpdateEmail({
        to: targetEmail,
        newRole
      });
      emailSent = emailResult.success;
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: `Profil mis à jour avec succès. ${emailSent ? 'Notification par e-mail envoyée.' : ''}`
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ error: err.message || 'Une erreur est survenue' }, { status: 500 });
  }
}
