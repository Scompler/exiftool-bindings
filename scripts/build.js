'use strict';
const { execFile } = require('child_process');
const { parseString } = require('xml2js');
const { dump } = require('js-yaml');
const _ = require('lodash');
const fs = require('fs');

const exiftool = require('@mcmics/dist-exiftool');

const whiteList = {
  'xmp': {
    'types': ['real', 'string', 'integer', 'date', 'boolean', 'rational'],
    'tables': ['XMP::Device', 'XMP::cc', 'XMP::aux', 'XMP::dc', 'XMP::exif', 'XMP::exifEX', 'XMP::ics', 'XMP::iptcCore', 'XMP::iptcExt', 'XMP::pdf', 'XMP::tiff', 'XMP::xmp', 'XMP::xmpRights']
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
  execFile(exiftool, ['-listx', `-${sectionName}:all`], (error, stdout, stderr) => {
    if (error) { console.log('exiftool error', stderr) }
    parseString(stdout, function (err, result) {
      const tables = result.taginfo.table.filter(table => {
        if (whiteList[sectionName].tables.includes(table.$.name)) return true
        console.log(`Skipping table ${table.$.name} for ${sectionName}`);
        return false;
      });

      let array = tables.map(table => table.tag).reduce((previous, current) => {
        return previous.concat(current);
      });

      array = array.filter(tag =>  {
        if (whiteList[sectionName].types.includes(tag.$.type)) return true
        console.log(`Skipping ${sectionName} field ${tag.$.name} with type ${tag.$.type}`);
        return false;
      });

      array.forEach(tag => {
        langDump = _.merge(langDump, extractTranslation(tag, sectionName));
      });

      array = array.map(tag => extractTag(tag));

      fs.writeFileSync(`json/${sectionName}.json`, JSON.stringify(array));
    });

    fs.writeFileSync(`yml/metadata_translations.yml`, dump(langDump));
  });
});

const extractTag = (tag) => {
  let output = {
    'name': tag.$.name,
    'type': tag.$.type,
    'writable': tag.$.writable
  }
  if (tag.values) output['values'] = tag.values[0].key.map(option => option.$.id)

  return output
}

const extractTranslation = (tag, sectionName) => {
  let translation = {}
  langs.forEach(lang => {
    const tagName = findTranslation(tag.desc, lang);
    const path = `${lang}.matadata.${sectionName}.${_.snakeCase(tag.$.name)}`
    if (tagName) _.set(translation, path, tagName);

    if (tag.values) {
      let options = {}
      tag.values[0].key.forEach(option => {
        const optionName = findTranslation(option.val, lang)
        if (optionName) options[option.$.id] = optionName
      })

      const optionPath = `${lang}.matadata.${sectionName}.${_.snakeCase(tag.$.name)}_values`
      if (Object.entries(options).length > 0) _.set(translation, optionPath, options);
    }
  })

  return translation
}

const findTranslation = (trasnlations, lang) => trasnlations.find(translation => translation.$.lang == lang)?._

