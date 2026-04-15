const mockFetch = jest.fn(async () => ({
  ok: true,
  status: 200,
}));

(global as any).fetch = mockFetch;
