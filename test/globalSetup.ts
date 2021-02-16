import fs from 'fs-extra';

import { rootTestOutDirPath } from './constants';

export default async function setup(): Promise<void> {
  await fs.emptyDir(rootTestOutDirPath);
}
