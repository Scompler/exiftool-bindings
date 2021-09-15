# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name = 'exiftool-bindings'
  spec.version = '1.0.0'
  spec.authors = ['Scompler team']
  spec.summary = 'Bindings for exiftool'
  spec.files = Dir.glob('lib/**') + Dir.glob('locale/*') +
               Dir.glob('yml/*')
  spec.platform      = Gem::Platform::RUBY
  spec.require_path  = 'lib'
  spec.required_rubygems_version = '>= 1.3.5'

  spec.add_runtime_dependency('i18n', '>= 0.9.5')
  spec.add_runtime_dependency('multi_json', '~> 1.0')
  spec.add_runtime_dependency('railties', '>= 4.2.0')
end
