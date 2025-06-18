import { TODO } from "@/types/types";
import { auth } from "@clerk/nextjs/server";

function myAuth(): typeof auth {
  const isTest = process.env.NEXT_PUBLIC_APP_ENV === "test";
  if (isTest) {
    console.warn("test environment detected, using mock auth");
    //@ts-ignore
    return () =>
      ({
        orgId: null,
        orgRole: null,
        userId: "user_2xub6Cozc0gvjPv5MyDitC4mp9s",
        getToken: async () => {
          return "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDIyMkFBQSIsImtpZCI6Imluc18yd2VDZm9udFBuMTg4ME1pT3VhejVyUkZzeG0iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJjb252ZXgiLCJlbWFpbCI6Im5udWRhNTQzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJleHAiOjE3NDg5NDg2MzcsImZhbWlseV9uYW1lIjpudWxsLCJnaXZlbl9uYW1lIjpudWxsLCJpYXQiOjE3NDg5NDUwMzcsImlzcyI6Imh0dHBzOi8vc21vb3RoLW1vbGx1c2stNzguY2xlcmsuYWNjb3VudHMuZGV2IiwianRpIjoiODhlYWEyODAwMTdiNTc0YjFkYzEiLCJuYW1lIjpudWxsLCJuYmYiOjE3NDg5NDUwMzIsIm5pY2tuYW1lIjoidGVzdCIsInBob25lX251bWJlciI6bnVsbCwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vaW1nLmNsZXJrLmNvbS9leUowZVhCbElqb2laR1ZtWVhWc2RDSXNJbWxwWkNJNkltbHVjMTh5ZDJWRFptOXVkRkJ1TVRnNE1FMXBUM1ZoZWpWeVVrWnplRzBpTENKeWFXUWlPaUoxYzJWeVh6SjRkV0kyUTI5Nll6Qm5kbXBRZGpWTmVVUnBkRU0wYlhBNWN5SjkiLCJzdWIiOiJ1c2VyXzJ4dWI2Q296YzBndmpQdjVNeURpdEM0bXA5cyIsInVwZGF0ZWRfYXQiOjE3NDg5NDUwMzZ9.QSOChN6Qv207_54DDyCXvHSaHmMyaHfxnJB60F4UweNqmcO7Nbm8p_-djIYoXuewmZMkxP6n-oL9i6hjfW3_uk209vOK088Jtu4dMB4raMIyO7Utkf0P0ugGBIP0lhwUKexn7_PSiWBU7izkrVr-QBeWjcSZRjHexH0329DbnVrGHsYt2GXpMA80lypM9y2eG7O3DARx2UkUh4R6qhE707oq_FWs2FuUGDVBlbiICXf1K0OlD3jkdRpnnCLgTUgz0-Jje131Lstp6b65FP6JqK1sDLFkuOxD5QA83vM2byfERlQjQSBsgDJ_2fGe3Cyv1VB9IBOULXvrXyFqh0F6gg";
        },
      }) as TODO;
  }
  return auth;
}

export default myAuth();
