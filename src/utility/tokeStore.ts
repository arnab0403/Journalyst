const tokenStore: Record<string, { accessToken: string}> = {};

export function getUserToken(userId: string) {
  console.log(tokenStore[userId]);
  return tokenStore[userId];
}

export function saveUserToken(userId: string, tokens: any) {
  tokenStore[userId] = tokens;
  console.log(tokenStore);
}

export function removeUserToken(userId:string){
    delete tokenStore[userId];
}
