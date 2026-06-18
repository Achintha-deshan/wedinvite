'use server'

import { createServerSupabaseClient, createAdminClient } from '../../lib/supabase-server'

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export async function addGuestAction(formData: {
  name: string
  phoneOrEmail: string
  side: 'boy' | 'girl'
}) {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const token = generateToken()

  const { data, error } = await admin
    .from('guests')
    .insert({
      couple_id: user.id,
      name: formData.name,
      phone_or_email: formData.phoneOrEmail,
      side: formData.side,
      unique_token: token,
      rsvp_status: 'pending'
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getGuestsAction() {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await admin
    .from('guests')
    .select('*')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function deleteGuestAction(guestId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from('guests').delete().eq('id', guestId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ==================== GET INVITATION BY TOKEN (public, guest-facing) ====================
export async function getInvitationByTokenAction(token: string) {
  const admin = createAdminClient()

  const { data: guest, error: guestError } = await admin
    .from('guests')
    .select('*')
    .eq('unique_token', token)
    .single()

  if (guestError || !guest) return { success: false, error: 'Invitation not found' }

  const { data: couple, error: coupleError } = await admin
    .from('couples')
    .select('*')
    .eq('id', guest.couple_id)
    .single()

  if (coupleError || !couple) return { success: false, error: 'Invitation not found' }

  return { success: true, guest, couple }
}

// ==================== SUBMIT RSVP (public, guest-facing) ====================
export async function submitRsvpAction(token: string, status: 'confirmed' | 'declined', guestCount: number) {
  const admin = createAdminClient()

  const { error } = await admin
    .from('guests')
    .update({
      rsvp_status: status,
      guest_count: guestCount,
      responded_at: new Date().toISOString()
    })
    .eq('unique_token', token)

  if (error) return { success: false, error: error.message }
  return { success: true }
}