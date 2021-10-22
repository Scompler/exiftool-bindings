# frozen_string_literal: true

module ExiftoolBindings
  module CoreExtensions
    module SnakeCase #:nodoc:
      def snake_case
        # Lodash like underscore
        # Converts 'FocalLengthIn35mmFormat' to focal_length_in_35_mm_format
        # Or XMP-xmp:ModifyDate to xmp_xmp_modify_date
        # Unlike underscore (focal_length_in35mm_format)
        word = underscore
        word.gsub!(/([a-z])([\d])/, '\1_\2')
        word.gsub!(/([\d])([a-z])/, '\1_\2')
        word.gsub!(':', '_')
        word
      end
    end
  end
end
