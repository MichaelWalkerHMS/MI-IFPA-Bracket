import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

export default async function globalSetup() {
  // Load test environment variables
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test') })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  const testUserId = process.env.E2E_TEST_USER_ID

  if (!supabaseUrl || !supabaseServiceKey || !testUserId) {
    console.warn(
      'Skipping test user cleanup - missing environment variables.\n' +
      'For full E2E tests, ensure .env.test contains:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- SUPABASE_SERVICE_KEY\n' +
      '- E2E_TEST_USER_ID'
    )
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Clean slate before tests run - delete all test user's brackets
  // (picks cascade delete with brackets)
  console.log('Cleaning up test user data...')

  // Delete brackets
  const { error: bracketsError } = await supabase
    .from('brackets')
    .delete()
    .eq('user_id', testUserId)

  if (bracketsError) {
    console.warn('Warning: Could not delete brackets:', bracketsError.message)
  }

  console.log('Test user data cleanup complete')
}
