import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Variables de Supabase para los tests (no conectan a nada real)
vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
