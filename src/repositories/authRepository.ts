// src/repositories/authRepository.ts

export async function mockLogin(username: string, password: string) {
    // In a real scenario, you'd call your FastAPI endpoint:
    // const response = await axios.post('/auth/login', { username, password });
    // return response.data.token;
  
    // For now, just do a quick check:
    if (username === 'test' && password === 'test') {
      return { token: 'fake-jwt-token' };
    } else {
      throw new Error('Invalid credentials');
    }
  }
  