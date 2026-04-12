import raw from '../translations';

const DEFAULT_LANG = 'no';

export const GlobalT = {
  lang: DEFAULT_LANG,
  data: raw[DEFAULT_LANG],

  setLang(lang) {
    this.lang = raw[lang] ? lang : DEFAULT_LANG;
    this.data = raw[this.lang];
  },

  t(key) {
    return this.data[key] || key;
  }
};