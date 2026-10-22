import { edition } from '../edition'
import * as times from './times'
import * as tidsskrift from './tidsskrift'

// The look of the paper this build is
export const paper = edition.id === 'tidsskrift' ? tidsskrift : times
