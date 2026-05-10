import { nanoid } from 'nanoid';
const generateRandomCode = (length: number): string => {
  return nanoid(length);
}

export default generateRandomCode;
