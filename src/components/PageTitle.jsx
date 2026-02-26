import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';

const ROUTE_TITLE_IDS = {
  '/broadcast': 'header.broadcast',
  '/listen': 'header.listen',
  '/settings': 'header.settings',
};

export function PageTitle() {
  const { pathname } = useLocation();
  const intl = useIntl();
  const titleId = ROUTE_TITLE_IDS[pathname];
  return titleId ? intl.formatMessage({ id: titleId }) : null;
}
