import privacyPolicy from './privacyPolicy';
import kvkk from './kvkk';

export const LEGAL_DOCUMENTS = {
  privacyPolicy,
  kvkk,
};

export const getLegalDocument = key => LEGAL_DOCUMENTS[key] || null;
