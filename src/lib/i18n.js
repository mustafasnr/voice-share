import en from '../locales/en.json';
import tr from '../locales/tr.json';

const messages = { en, tr };

export const flattenMessages = (nestedMessages, prefix = '') => {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
};

export const getBrowserLocale = () => {
  const locale = navigator.language.split(/[-_]/)[0];
  return messages[locale] ? locale : 'en';
};

export const getMessages = (locale) => {
  return flattenMessages(messages[locale] || messages.en);
};
