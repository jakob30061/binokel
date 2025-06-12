import en from './en'
import de from './de'

type Schema = typeof de

const messages: {
  en: Schema,
  de: Schema
} = {
  en,
  de
}

export default defineI18nConfig(() => ({
  legacy: false,
  globalInjection: true,
  locale: 'de',
  messages
}))