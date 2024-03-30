export default interface JwtConfigInterface {
  secret: string;
  expiresIn: string;
  publicKeyPath: string;
  publicKey: string;
}
