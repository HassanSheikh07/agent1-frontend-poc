/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * Single style object assembled from the per-concern modules, so components can
 * keep using styles.<name> without knowing which module a rule lives in.
 */

import React from 'react'

import { layoutStyles } from './layout'
import { statusStyles } from './status'
import { cardStyles } from './cards'
import { formStyles } from './forms'
import { buttonStyles } from './buttons'

export const styles: { [key: string]: React.CSSProperties } = {
  ...layoutStyles,
  ...statusStyles,
  ...cardStyles,
  ...formStyles,
  ...buttonStyles
}

export { layoutStyles, statusStyles, cardStyles, formStyles, buttonStyles }
