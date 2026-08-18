# MeshForge AI commercial sales checklist

This checklist is operational guidance, not a substitute for a signed commercial agreement or legal review.

## Before the first sale

- Confirm that Bilel JM or the selling entity owns the original MeshForge AI code and has permission to distribute every bundled asset.
- Choose the sales model: per-seat license, per-device license, studio license, or hosted subscription.
- Define the exact edition, version, number of seats, supported operating systems, update period, and support level in the order document.
- Review the complete dependency and asset notices in `THIRD_PARTY_NOTICES.md`.
- Decide which AI providers are supported and state clearly that provider fees, quotas, model terms, and generated output are separate.
- Sign or accept the commercial agreement before delivering private source access or license keys.

## Release preparation

- Run `npm run lint` and `npm run build`.
- Build the required Linux or Windows artifact in a controlled release environment.
- Sign installers when possible and publish SHA-256 checksums.
- Test installation, launch, file import, file export, and optional-provider failure fallback on each supported platform.
- Remove test credentials, customer files, local endpoints, debug logs, and development-only assets from the release.
- Include `LICENSE`, `THIRD_PARTY_NOTICES.md`, release notes, support contact, and the customer license identifier.

## Delivery

- Deliver compiled artifacts through a controlled channel rather than a public source repository.
- Provide the customer with the invoice or order record, license scope, download link, version number, checksum, and support instructions.
- Never reuse one customer's API key, private endpoint, license key, or source archive for another customer.
- Keep the full source repository private and restrict access to the people who need it.

## Public showcase

A public showcase should contain only a product description, screenshots, a short video, a feature matrix, supported platforms, and a contact or purchase link. It must not contain the implementation source, private build artifacts, customer data, provider credentials, signing keys, or internal release scripts.

## Recommended customer-facing offer

MeshForge AI — Desktop 3D Asset Workbench

- Platforms: Windows and Linux
- Delivery: signed installer or controlled portable package
- Core mode: local procedural generation without a cloud key
- Optional integrations: Gemini, Ollama, vLLM, and LM Studio
- Exports: GLB, OBJ, STL, PNG snapshots, and Blender Python
- Commercial terms: defined per order by seat/device count, support period, and update entitlement

## Legal review points

Have counsel review ownership, open-source notices, AI-provider terms, warranties, liability limits, privacy obligations, export controls if relevant, refund terms, tax treatment, governing law, and any customer data processed by optional cloud providers.
