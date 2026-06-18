'use server'

import { createServerSupabaseClient, createAdminClient } from '../../lib/supabase-server'
// ==================== SIGNUP ====================
export async function signUpAction({
  email,
  password,
  username
}: {
  email: string
  password: string
  username: string
}) {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const cleanEmail = email.toLowerCase().trim()
  const cleanUsername = username.toLowerCase().trim()

  // Username check
  const { data: existingUsername } = await admin
    .from('users')
    .select('username')
    .eq('username', cleanUsername)
    .single()

  if (existingUsername) {
    return { success: false, error: 'Username already taken' }
  }

  // Auth signup
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
  })

  if (authError) return { success: false, error: authError.message }
  if (!authData.user) return { success: false, error: 'Signup failed' }

  // Users table
  const { error: userError } = await admin
    .from('users')
    .insert({
      id: authData.user.id,
      email: cleanEmail,
      username: cleanUsername,
      role: 'couple'
    })

  if (userError) return { success: false, error: userError.message }

  // Couples table
  const { error: coupleError } = await admin
    .from('couples')
    .insert({
      id: authData.user.id,
      is_profile_completed: false
    })

  if (coupleError) return { success: false, error: coupleError.message }

  return { success: true }
}

// ==================== SIGNIN ====================
export async function signInAction({
  identifier,
  password
}: {
  identifier: string
  password: string
}) {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  let emailToLogin = identifier.toLowerCase().trim()

  // Username දිගේ login
  if (!identifier.includes('@')) {
    const { data: userData } = await admin
      .from('users')
      .select('email')
      .eq('username', emailToLogin)
      .single()

    if (!userData) return { success: false, error: 'Account not found' }
    emailToLogin = userData.email
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ==================== UPDATE PROFILE ====================
export async function updateProfileAction(formData: {
  boyName: string
  girlName: string
  boyFatherName: string
  boyMotherName: string
  girlFatherName: string
  girlMotherName: string
  weddingDate: string
  ceremonyTime: string
  receptionTime: string
  dinnerTime: string
  venueName: string
  venueAddress: string
  mapUrl: string
  additionalNotes: string
}) {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await admin
    .from('couples')
    .update({
      boy_name: formData.boyName,
      girl_name: formData.girlName,
      boy_father_name: formData.boyFatherName,
      boy_mother_name: formData.boyMotherName,
      girl_father_name: formData.girlFatherName,
      girl_mother_name: formData.girlMotherName,
      wedding_date: formData.weddingDate || null,
      ceremony_time: formData.ceremonyTime || null,
      reception_time: formData.receptionTime || null,
      dinner_time: formData.dinnerTime || null,
      venue_name: formData.venueName,
      venue_address: formData.venueAddress,
      map_url: formData.mapUrl,
      additional_notes: formData.additionalNotes,
      is_profile_completed: true
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ==================== GET PROFILE ====================
export async function getProfileAction() {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await admin
    .from('couples')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

// ==================== SIGNOUT ====================
export async function signOutAction() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  return { success: true }
}

// ==================== UPDATE PHOTOS & MUSIC ====================
export async function updateMediaAction(formData: {
  boyPhotoUrl?: string
  girlPhotoUrl?: string
  togetherPhotoUrl?: string
  storyPhotoUrl?: string
  musicYoutubeUrl?: string
  templateId?: string
}) {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const updateData: any = {}
  if (formData.boyPhotoUrl) updateData.boy_photo_url = formData.boyPhotoUrl
  if (formData.girlPhotoUrl) updateData.girl_photo_url = formData.girlPhotoUrl
  if (formData.togetherPhotoUrl) updateData.together_photo_url = formData.togetherPhotoUrl
  if (formData.storyPhotoUrl) updateData.story_photo_url = formData.storyPhotoUrl
  if (formData.musicYoutubeUrl !== undefined) updateData.music_youtube_url = formData.musicYoutubeUrl
  if (formData.templateId) updateData.template_id = formData.templateId

  const { error } = await admin
    .from('couples')
    .update(updateData)
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ==================== CONFIRM TEMPLATE USE ====================
export async function confirmTemplateUseAction(templateId: string) {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await admin
    .from('couples')
    .update({ template_id: templateId })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

