import { test, expect, request } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

const BASE_URL = 'http://localhost:3000'
test.describe('API Tests', () => {
  let api

  test.beforeAll(async ({ playwright }) => {
    api = await request.newContext()
  })

  test.beforeEach(async () => {
  await api.post(`${BASE_URL}/reset`)
  })

  test('GET /hello should return hello', async () => {
    const res = await api.get(`${BASE_URL}/hello`)
    expect(res.status()).toBe(200)
    expect(await res.text()).toBe('hello')
  })

  test('GET /users should list all first names', async () => {
    const res = await api.get(`${BASE_URL}/users`)
    expect(res.status()).toBe(200)
    const text = await res.text()
    expect(text).toContain('Paul')
    expect(text).toContain('Elie')
  })

  test('GET /users/:first_name should return correct user', async () => {
    const res = await api.get(`${BASE_URL}/users/Paul`)
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toMatchObject({
      first_name: 'Paul',
      last_name: 'Sawaya',
      age: 21
    })
  })

  test('GET /users/:first_name should return 404 for missing user', async () => {
    const res = await api.get(`${BASE_URL}/users/Unknown`)
    expect(res.status()).toBe(404)
  })

  test('GET /olderThan/:age should filter correctly', async () => {
    const res = await api.get(`${BASE_URL}/olderThan/25`)
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    for (const person of data) {
      expect(person.age).toBeGreaterThan(25)
    }
  })

  test('POST /users should add new user', async () => {
    const newUser = {
      first_name: 'Maria',
      last_name: 'Haddad',
      age: 30
    }

    const res = await api.post(`${BASE_URL}/users`, { data: newUser })
    expect(res.status()).toBe(200)
    expect(await res.text()).toBe('User added successfully')

    // Verify it's added
    const check = await api.get(`${BASE_URL}/users/Maria`)
    expect(check.status()).toBe(200)
    const data = await check.json()
    expect(data.first_name).toBe('Maria')
  })

  test('POST /users should fail if missing fields', async () => {
    const res = await api.post(`${BASE_URL}/users`, { data: { first_name: 'OnlyName' } })
    expect(res.status()).toBe(400)
  })

  test('POST /users should be fail if duplicate fields', async() => {
    const first = await api.post('http://localhost:3000/users', {
      data: { first_name: 'Anthony', last_name: 'Lahoud', age: 25 }
    }) 
    expect(first.status()).toBe(200)

    // try to create same user again
    const duplicate = await api.post('http://localhost:3000/users', {
      data: { first_name: 'Anthony', last_name: 'Lahoud', age: 25 }
    })

    // backend should reject it
    expect(duplicate.status()).toBe(400)
    const text = await duplicate.text()
    expect(text).toContain('Person already exists')
  })
})
