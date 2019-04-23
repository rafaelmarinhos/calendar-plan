// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyCZ4K-rV1XHEIbTbttyzeTj-mVouR5kUnU',
    authDomain: 'calendar-plan-b4578.firebaseapp.com',
    databaseURL: 'https://calendar-plan-b4578.firebaseio.com',
    projectId: 'calendar-plan-b4578',
    storageBucket: 'calendar-plan-b4578.appspot.com',
    messagingSenderId: '568652731569'
  },
  colors: {
    red: {primary: '#ad2121', secondary: '#FAE3E3'},
    blue: {primary: '#1e90ff', secondary: '#D1E8FF'},
    yellow: {primary: '#e3bc08', secondary: '#FDF1BA'}
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
