import tr from '../locales/tr.json';
import en from '../locales/en.json';
import de from '../locales/de.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ind from '../locales/ind.json';
import it from '../locales/it.json';
import jp from '../locales/jp.json';
import ru from '../locales/ru.json';
import cn from '../locales/cn.json';

const messages = { en, tr, de, es, jp, ind, it, ru, fr, cn };

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
