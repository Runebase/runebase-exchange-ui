/*
* Model for Chart
*
*
*/
export default class Chart {
  tokenAddress

  time

  volume

  // for invalid option
  localizedInvalid = {};

  constructor(chart, app) {
    Object.assign(this, chart);
    this.app = app;
    this.tokenAddress = chart.tokenAddress;
    this.time = chart.time;
    this.volume = chart.volume;
    this.localizedInvalid = {
      en: 'Invalid',
      pt: 'Portuguese',
      nl: 'Nederlands',
      parse(locale) {
        return this[locale.slice(0, 2)];
      },
    };
  }
}
