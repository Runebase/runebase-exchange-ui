import { addLocaleData } from 'react-intl';
import Enlang from './entries/en-US';

addLocaleData(Enlang.data);

export default {
  [Enlang.locale]: Enlang,
};
