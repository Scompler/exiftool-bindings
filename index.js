import exif from './json/exif.json';
import iptc from './json/iptc.json';
import xmp from './json/xmp.json';

import readMimeTypes from './json/read-mime-types.json';
import writeMimeTypes from './json/write-mime-types.json';

export default { 
  sections: { exif, iptc, xmp },
  readMimeTypes,
  writeMimeTypes
};
