import * as migration_20261029_124551_initial from './20261029_124551_initial';
import * as migration_20261105_205216_ui_texts_to_code from './20261105_205216_ui_texts_to_code';

export const migrations = [
  {
    up: migration_20261029_124551_initial.up,
    down: migration_20261029_124551_initial.down,
    name: '20261029_124551_initial',
  },
  {
    up: migration_20261105_205216_ui_texts_to_code.up,
    down: migration_20261105_205216_ui_texts_to_code.down,
    name: '20261105_205216_ui_texts_to_code'
  },
];
