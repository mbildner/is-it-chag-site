import  {HebrewCalendar, Location} from '@hebcal/core';
import  { eventsToClassicApi } from '@hebcal/rest-api';
import zipcode_to_timezone from 'zipcode-to-timezone';
import zipToCoordinatesMap from './zip_to_coordinates.json';

const ZIP_REGEX = /\d{5}/;

const handleIsChagQuery = (timestamp, zip) => {
  const nowString = timestamp;

  const now = new Date(nowString);

  if (!ZIP_REGEX.test(zip)) {
    return `sorry zip <${zip}> looks invalid`;
  }
  const todayString = nowString.split('T')[0];
  const [year, month, day] = todayString.split('-').map(n => parseInt(n, 10));
  const zipLocation = Location.lookup(zip);
  if (!zipLocation) {
    throw new Error(`could not find location for zip: ${zip}`)
  }

  const options = {
    year,
    month,
    candlelighting: true,
    location: zipLocation,
  };

  const events = eventsToClassicApi(
    HebrewCalendar.calendar(options), options
  );

  const todayEvent = events.items.find(
    event => {
      const eventDateString = event.date.split('T')[0];
      return event.yomtov && todayString === eventDateString; // TODO: does yomtov=true denote shabbat as well???
    }
  );

  if (!todayEvent) {
    return `No. Today is not Chag`;
  } else {
    const havdalahThatWasToday = events.items.find(
      ({
        category,
        date
      }) => {
        return (
          category === 'havdalah' &&
          date.split('T')[0] === todayString &&
          now >= new Date(date)
        )
      }
    );

    const msg = havdalahThatWasToday
    ? `No, today was a Yom Tov, but Havdalah was at ${havdalahThatWasToday.date}`
    : `Yes! today is ${todayEvent.title} (${todayEvent.subcat} ${todayEvent.category})`;

    return msg;
  }
}

const addZips = () => {
    Object.keys(zipToCoordinatesMap).forEach(
        zip => {
            const [lat, lng] = zipToCoordinatesMap[zip];
            const timeZone = zipcode_to_timezone.lookup(zip)

            const l = new Location(
                lat,
                lng,
                false,
                timeZone,
                zip,
                'US'
            );
            
            const success = Location.addLocation(zip, l);

            if (!success) {
                console.warn(`failed to add ${zip}`);
            }
        }
    );
};

window.document.addEventListener('DOMContentLoaded', () => {
    addZips();

    const getMaybeZip = () => {
        const maybeZip = document.getElementById('zipInput').value.trim();
        handleIsChagQuery((new Date()).toISOString(), maybeZip);
    };

    getMaybeZip();

    document.getElementById('zipChooseButton')
        .addEventListener('click', () => {
            const maybeZip = document.getElementById('zipInput').value.trim();
            const result = handleIsChagQuery((new Date()).toISOString(), maybeZip);
            console.log(result)
        });
});


// export {
//     handleIsChagQuery,
//     handleIsItChagButtonClick,
//     addZips,
// }