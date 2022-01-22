const GREETINGS = {
  'greetings.hello': 'Hello {name}',
  'greetings.hi': 'Hi!',
  'greetings.bye': 'Bye',
  'greetings.goodbye': 'Goodbye!'
};

const EXTRA = {
  'extra.nice_weather': "It's {temperature}, it's a nice weather!",
  'extra.only_english': "I'm only available in english."
};

module.exports = {
  ...GREETINGS,
  ...EXTRA
};
