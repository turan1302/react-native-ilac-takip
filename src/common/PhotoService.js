import { NativeModules } from 'react-native';

const native = () => NativeModules.NextDoseWidget;

export const pickPillPhoto = async () => {
  const module = native();
  if (!module?.pickImage) {
    throw new Error('PHOTO_UNAVAILABLE');
  }

  const result = await module.pickImage();
  if (!result) {
    return null;
  }

  if (typeof result === 'string') {
    return { path: result, base64: '' };
  }

  return {
    path: result.path || result.uri || '',
    base64: result.base64 || '',
  };
};

export const readPhotoBase64 = async path => {
  const module = native();
  if (!module?.readImageBase64 || !path) {
    return '';
  }

  try {
    return (await module.readImageBase64(path)) || '';
  } catch (error) {
    return '';
  }
};

export const writePhotoBase64 = async (filename, base64) => {
  const module = native();
  if (!module?.writeImageBase64) {
    throw new Error('PHOTO_WRITE_UNAVAILABLE');
  }

  return module.writeImageBase64(filename, base64);
};
