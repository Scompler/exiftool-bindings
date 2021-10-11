'use strict';
const { execFile } = require('child_process');
const { parseString } = require('xml2js');
const { dump } = require('js-yaml');
const _ = require('lodash');
const fs = require('fs');
var mimeDB = require('mime-db');

const exiftool = require('@mcmics/dist-exiftool');

const whiteList = {
  'xmp': {
    'types': ['real', 'string', 'integer', 'date', 'boolean', 'rational', 'lang-alt'],
    'tables': ['XMP::Device', 'XMP::cc', 'XMP::exif', 'XMP::exifEX', 'XMP::ics', 'XMP::iptcCore', 'XMP::iptcExt',
              'XMP::xmp', 'XMP::xmpRights', 'UserDefined::fwc', 'XMP::photoshop', 'XMP::dc']
  },
  'exif': {
    'types': ['string', 'int16u', 'rational64u', 'int16s', 'rational64s'],
    'tables': ['Exif::Main', 'GPS::Main']
  },
  'iptc': {
    'types': ['string'],
    'tables': ['IPTC::ApplicationRecord', 'IPTC::NewsPhoto']
  }
}

const langs = ['en', 'de']
let langDump = {};

Object.keys(whiteList).forEach((sectionName) => {
  execFile(exiftool, ['-config', 'exiftool.config', '-listx', `-${sectionName}:all`, '-f'], {maxBuffer: 1024 * 102400 }, (error, stdout, stderr) => {
    let outObject = {}

    parseString(stdout, function (err, result) {
      result.taginfo.table.forEach(table => {
        if (!whiteList[sectionName].tables.includes(table.$.name)) {
          console.log(`Skipping table ${table.$.name} for ${sectionName}`);
          return;
        }

        let array = table.tag;

        array.forEach(tag => { tag.$["flags"] = tag.$.flags?.split(',') || [] })

        array.forEach(tag => {
          const tagName = `${table.$.g1}:${tag.$.name}`;
          if (hasDuplicate(tag, array) && tag.$.type === 'string') {
            console.log(`Skipping ${sectionName} field ${tagName} with type ${tag.$.type} because it has duplicate`);
          } else if (tag.$.flags.includes('Binary')) {
            console.log(`Skipping ${sectionName} field ${tagName} with Binary flag`);
          } else if (whiteList[sectionName].types.includes(tag.$.type)) {
            if (outObject[tagName]) console.log(`Warning ${tagName} has dup!`);
            const groupPrefix = table.$.g1.replace(`${table.$.g0}-`, '');
            langDump = _.merge(langDump, extractTranslation(tag, tagName, sectionName, groupPrefix));
            outObject[tagName] = extractTag(tag);
          } else {
            console.log(`Skipping ${sectionName} field ${tagName} with type ${tag.$.type}`);
          }
        });
      });

      fs.writeFileSync(`json/${sectionName}.json`, JSON.stringify(outObject));
    });

    fs.writeFileSync(`yml/translations.yml`, dump(langDump));
  });
});

const extractTag = (tag) => {
  let output = { 'type': tag.$.type }

  if (tag.$.flags.includes('List')) output['list'] = true
  if (tag.$.writable && _.intersection(tag.$.flags, ['Avoid', 'Unsafe', 'Mandatory']).length === 0) output['writable'] = true
  if (tag.values) output['values'] = tag.values[0].key.map(option => findTranslation(option.val, 'en'))

  return output
}

const hasDuplicate = (tag, array) => {
  const duplicates = array.filter(currentTag => (currentTag.$.name === tag.$.name))
  return duplicates.length > 1 && _.last(duplicates).$.id === tag.$.id
}

const extractTranslation = (tag, tagName, sectionName, prefix) => {
  let translation = {}
  langs.forEach(lang => {
    let localizedTagName = findTranslation(tag.desc, lang);
    const path = `${lang}.metadata.${sectionName}.${_.snakeCase(tagName)}`;

    if (localizedTagName) {
      localizedTagName = `${prefix}:${localizedTagName}`;
      _.set(translation, path, localizedTagName);
    }

    if (tag.values) {
      let options = {}
      tag.values[0].key.forEach(option => {
        const optionName = findTranslation(option.val, lang)
        const optionKey = _.snakeCase(findTranslation(option.val, 'en'))
        if (optionName) options[optionKey] = optionName
      })

      const optionPath = `${path}_values`
      if (Object.entries(options).length > 0) _.set(translation, optionPath, options);
    }
  })

  return translation
}

const findTranslation = (trasnlations, lang) => trasnlations.find(translation => translation.$.lang == lang)?._

