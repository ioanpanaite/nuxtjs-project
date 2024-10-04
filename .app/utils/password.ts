import * as crypto from 'crypto';

const EXPIRE_TIME = 12 * 60 * 60 * 1000; // 12 hours

const chars = [
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
  '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
]

export function generatePassword() {
  const password = shuffleArray(chars.join('').split(''))
    .join('')
    .substring(0, 30)

  return password
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function generatePromoCode() {
  const code = shuffleArray('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))
    .join('')
    .substring(0, 10)
  return code
}


export function generateResetToken(user: any) {
  const now = new Date();
  const timeBase64 = Buffer.from(now.getTime().toString()).toString('base64');
  const userIdBase64 = Buffer.from(user?.id as string).toString('base64');

  const userInfo = `${user?._id}-${user?.email}-${user?.password}-${user?.updatedAt}`;
  const userInfoHash = crypto.createHash('md5').update(userInfo).digest('hex');

  const tokenize = `${userIdBase64}-${userInfoHash}-${timeBase64}`;
  return encryptToken(tokenize);
}

export function encryptToken(toEncrypt: string) {
  const key = crypto.createHash('sha256').update('forfiles').digest();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = cipher.update(toEncrypt);

  const cipherEncrypt = Buffer.concat([encrypted, cipher.final()]);
  const result = Buffer.from(`${iv.toString('hex')}@${cipherEncrypt.toString('hex')}`).toString('base64');
  return result;
}

export function decryptToken(encryptToken: string) {
  try {
    // Decrypt token from encrypted token
    const decryptToken = Buffer.from(encryptToken, 'base64').toString('ascii');

    const key = crypto.createHash('sha256').update('forfiles').digest();
    const splitToken = decryptToken.split('@');
    const iv = Buffer.from(splitToken.shift() as string, 'hex');
    const encrypted = Buffer.from(splitToken.join('@'), 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = decipher.update(encrypted);

    const result = Buffer.concat([decrypted, decipher.final()]);
    return result.toString();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function getResetTokenInfo(token: string) {
  const decToken = decryptToken(token);
  const info = decToken?.split('-') as string[];
  const userIdBase64 = info[0];
  const userInfoHash = info[1];
  const timeBase64 = info[2];

  const timestamp = Buffer.from(timeBase64, 'base64').toString('ascii');
  const userId = Buffer.from(userIdBase64, 'base64').toString('ascii');

  return { timestamp, userId, userInfoHash }
}

export function validationToken(token: string, user: any) {
  const { timestamp, userInfoHash } = getResetTokenInfo(token);
  const now = new Date();
  console.log(now.getTime().toString(), timestamp)
  const diffHour = (now.getTime() - parseInt(timestamp)) / EXPIRE_TIME;

  // Validation failed if it's expired 12 hours
  if (diffHour > 12) return false;

  const validUser = `${user?.id}-${user?.email}-${user?.password}-${user?.updatedAt}`;
  const validUserHash = crypto.createHash('md5').update(validUser).digest('hex');

  return userInfoHash === validUserHash
}