const tokenStore: Record<string, { accessToken: string}> = {};

export function getUserToken(userId: string) {
  return tokenStore[userId].accessToken;
}

export function saveUserToken(userId: string, tokens: any) {
  tokenStore[userId] = tokens;
}

export function removeUserToken(userId:string){
    delete tokenStore[userId];
}
