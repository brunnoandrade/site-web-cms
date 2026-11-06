import * as migration_20261029_124551_initial from './20261029_124551_initial';
import * as migration_20261105_205216_ui_texts_to_code from './20261105_205216_ui_texts_to_code';
import * as migration_20261106_135854_tracking_and_company from './20261106_135854_tracking_and_company';
import * as migration_20261106_172835_indexing_and_icons from './20261106_172835_indexing_and_icons';
import * as migration_20261106_174703_remove_catalog_banners_redirects from './20261106_174703_remove_catalog_banners_redirects';

export const migrations = [
  {
    up: migration_20261029_124551_initial.up,
    down: migration_20261029_124551_initial.down,
    name: '20261029_124551_initial',
  },
  {
    up: migration_20261105_205216_ui_texts_to_code.up,
    down: migration_20261105_205216_ui_texts_to_code.down,
    name: '20261105_205216_ui_texts_to_code',
  },
  {
    up: migration_20261106_135854_tracking_and_company.up,
    down: migration_20261106_135854_tracking_and_company.down,
    name: '20261106_135854_tracking_and_company',
  },
  {
    up: migration_20261106_172835_indexing_and_icons.up,
    down: migration_20261106_172835_indexing_and_icons.down,
    name: '20261106_172835_indexing_and_icons',
  },
  {
    up: migration_20261106_174703_remove_catalog_banners_redirects.up,
    down: migration_20261106_174703_remove_catalog_banners_redirects.down,
    name: '20261106_174703_remove_catalog_banners_redirects'
  },
];
