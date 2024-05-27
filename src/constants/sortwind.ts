const sortwindPrefix = 'sortwind';

export enum SortwindConfig {
  CLASS_REGEX = `${sortwindPrefix}.classRegex`,
  DEFAULT_SORT_ORDER = `${sortwindPrefix}.defaultSortOrder`,
  CUSTOM_TAILWIND_PREFIX = `${sortwindPrefix}.customTailwindPrefix`,
  REMOVE_DUPLICATES = `${sortwindPrefix}.removeDuplicates`,
  PREPEND_CUSTOM_CLASSES = `${sortwindPrefix}.prependCustomClasses`,
  SORT_TAILWIND_CLASSES = `${sortwindPrefix}.sortTailwindClasses`,
  SORT_TAILWIND_CLASSES_ON_WORKSPACE = `${sortwindPrefix}.sortTailwindClassesOnWorkspace`,
  RUN_ON_SAVE = `${sortwindPrefix}.runOnSave`,
}
