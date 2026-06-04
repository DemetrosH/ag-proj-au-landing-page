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
    const { targetUserId, targetEmail, newRole } = await request.json();

    if (!targetUserId || !targetEmail || !newRole) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Prevent self-demotion
    if (targetUserId === user.id && newRole !== 'admin') {
      return NextResponse.json({ error: 'Vous ne pouvez pas retirer votre propre rôle administrateur.' }, { status: 400 });
    }

    // 3. Update profile role in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Send notification email to the user
    const emailResult = await sendRoleUpdateEmail({
      to: targetEmail,
      newRole
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      message: `Rôle mis à jour avec succès. Notification envoyée : ${emailResult.success ? 'Oui' : 'Non'}`
    });
  } catch (err: any) {
    console.error('Error changing role:', err);
    return NextResponse.json({ error: err.message || 'Une erreur est survenue' }, { status: 500 });
  }
}
