# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-03-19

### Added
- Initial project setup
- Basic React application structure
- Express server implementation
- File upload functionality
- Image processing capabilities

### Changed
- None

### Deprecated
- None

### Removed
- None

### Fixed
- None

### Security
- None 

## [Unreleased]

### Added
- Added structured card rules fields (`Text`, `Abilities`, `SpecialAbilities`) to `cards.json` to support richer search over card text.
- Added internal documentation describing options for separating card text into a dedicated JSON file and for adding a simple view counter.

### Changed
- **Share:** Share output now includes cost prefix for deployment cards; [E]/[R] suffix for Elite/Regular; IACP suffix for IACP variant cards (deployment and command); Traits on its own line (no blank line above).
- **cards.json:** Removed "Guardian" trait from Fennec. Removed The Armorer deployment card and its associated command card. Removed Asajj Ventress deployment card and its associated command card.
- Updated images for: You Will Not Deny Me [IACP], Moff Gideon [IACP], Purge Commander [Elite] [IACP].
- Updated image for Rancor [Elite] [IACP] deployment card.
 - Updated search logic so the card search box matches against `Name`, `Traits`, `Characteristics`, and the new structured card text fields (`Text`, `Abilities`, `SpecialAbilities`) instead of the legacy `AllText` field.

### Removed
- The Armorer deployment card and command card; Ventress deployment card and command card; Test [IACP] deployment image and thumbnail.