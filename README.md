# exiftool-bindings

 ExifTool bindings with field lists

## Installation:


### Webpack
Install via YARN

    yarn add Scompler/exiftool-bindings

And then, you can use fields list:

    import { exif, iptc, xmp } from 'exiftool-bindings'
### Ruby/Rails

Add the following string to Gemfile

    gem 'exiftool-bindings', github: 'Scompler/exiftool-bindings', branch: 'main'

Run

    bundle install

And then you can use it

    ExiftoolBindings::XMP
    ExiftoolBindings::EXIF
    ExiftoolBindings::IPTC

Translations are located at keys like

    I18n.t('metatada.xmp.focal_length_in_35_mm_format')
    I18n.t('metatada.xmp.scene_capture_type_values.4')
