export interface TokenPayload {
    userId: string
    email: string
}

export interface JwtTokens {
    accessToken: string
    refreshToken: string
}