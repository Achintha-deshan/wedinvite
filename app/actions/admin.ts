'use server'

import { createServerSupabaseClient, createAdminClient } from '../../lib/supabase-server'

// Check if current user is admin
export async function checkAdminAction() {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isAdmin: false }

  const { data } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return { isAdmin: data?.role === 'admin' }
}

// Get all couples with their payment status and guest counts
export async function getAllCouplesAction() {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('couples')
    .select(`
      id,
      boy_name,
      girl_name,
      wedding_date,
      venue_name,
      is_paid,
      is_profile_completed,
      template_id,
      created_at,
      users (
        username,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  // Fetch guest counts for all couples in one query, then merge in memory
  const { data: guestRows, error: guestError } = await admin
    .from('guests')
    .select('couple_id')

  if (guestError) return { success: false, error: guestError.message }

  const countByCouple: Record<string, number> = {}
  for (const row of guestRows || []) {
    countByCouple[row.couple_id] = (countByCouple[row.couple_id] || 0) + 1
  }

  const merged = (data || []).map((couple: any) => ({
    ...couple,
    guest_count: countByCouple[couple.id] || 0,
  }))

  return { success: true, data: merged }
}

// Toggle payment status
export async function togglePaymentStatusAction(coupleId: string, newStatus: boolean) {
  const admin = createAdminClient()

  const { error } = await admin
    .from('couples')
    .update({ is_paid: newStatus })
    .eq('id', coupleId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// Change which template a couple is assigned to
export async function changeTemplateAction(coupleId: string, templateId: string) {
  const admin = createAdminClient()

  const { error } = await admin
    .from('couples')
    .update({ template_id: templateId })
    .eq('id', coupleId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// Delete a couple and all their guests (admin only, irreversible)
export async function deleteCoupleAction(coupleId: string) {
  const admin = createAdminClient()

  // Delete guests first (no cascading FK assumed), then the couple row
  const { error: guestDeleteError } = await admin
    .from('guests')
    .delete()
    .eq('couple_id', coupleId)

  if (guestDeleteError) return { success: false, error: guestDeleteError.message }

  const { error: coupleDeleteError } = await admin
    .from('couples')
    .delete()
    .eq('id', coupleId)

  if (coupleDeleteError) return { success: false, error: coupleDeleteError.message }

  return { success: true }
}