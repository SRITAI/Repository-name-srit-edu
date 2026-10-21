# Dashboard design and editorial photography

The October 2026 refresh takes its rounded cards, gradient card headers, profile
panel and grouped dashboard layout from [Dashboard Tennis by Ceptari Tyas](https://www.figma.com/community/file/882171933811828307/dashboard-tennis).
The public preview was inspected via [TitanUI](https://www.titanui.com/116736-modern-tennis-dashboard-figma-template/)
and the matching [Figma Elements listing](https://figmaelements.com/dashboard-tennis-app/).
The implementation follows the reference’s light lavender canvas, white cards,
violet gradient headers and blue action buttons, with sritedu peer-support copy.
The public homepage uses a dashboard composition instead of the former dark
marketing hero. This palette supersedes the earlier black/pink direction. It does not include the tennis template's illustrations or sports statistics.

Editable Figma layers were unavailable during implementation. The reference's
exact font and measurements have **not** been verified. Poppins is the selected
geometric sans-serif approximation. Four Latin weights (400–700) are bundled
through `@fontsource/poppins` and `next/font/local`; the browser does not request
Google Fonts. Poppins is distributed under the SIL Open Font License; the license
is included in the installed font package.

## Photography

These Pexels photographs were downloaded on 2026-10-20 and 2026-10-21, resized to 1200 pixels
wide and converted to WebP. They are served locally from
`public/images/editorial`, without tracking or third-party image requests.

| File                     | Photographer      | Source                                                                                                                                                     |
| ------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `connection.webp`        | Ketut Subiyanto   | [Women talking over coffee](https://www.pexels.com/photo/beautiful-women-friends-drinking-coffee-together-5047021/)                                        |
| `moving-forward.webp`    | Maria Tsegelnik   | [A person looking out at the sea](https://www.pexels.com/photo/back-view-of-a-woman-sitting-by-the-seaside-10845595/)                                      |
| `finance.webp`           | Kaboompics        | [Calculator and notebook](https://www.pexels.com/photo/calculator-and-notepad-placed-over-stack-of-paper-bills-4386373/)                                   |
| `studying.webp`          | Katerina Holmes   | [Taking notes beside a laptop](https://www.pexels.com/photo/crop-student-with-laptop-and-notebook-5905875/)                                                |
| `wellbeing.webp`         | Shashwat Goyar    | [Forest path in morning light](https://www.pexels.com/photo/serene-forest-path-at-sunrise-34565583/)                                                       |
| `relationships.webp`     | Ravi Roshan       | [Hands at sunset](https://www.pexels.com/photo/couple-holding-hands-at-sunset-20183377/)                                                                   |
| `founder.webp`           | Andrea Piacquadio | [Coworkers discussing a laptop project](https://www.pexels.com/photo/focused-multiracial-coworkers-of-different-age-using-laptop-during-teamwork-3865844/) |
| `career.webp`            | Sora Shimazaki    | [Completing a job application](https://www.pexels.com/photo/woman-filling-job-application-form-in-office-with-boss-5668858/)                               |
| `family.webp`            | Pavel Danilyuk    | [Family conversation](https://www.pexels.com/photo/a-daughter-and-her-mother-talking-7055095/)                                                             |
| `everything.webp`        | Atlantic Ambience | [Balanced stones on the beach](https://www.pexels.com/photo/stones-balanced-and-stacked-8026591/)                                                          |
| `community-feature.webp` | MART PRODUCTION   | [Friends walking in a park](https://www.pexels.com/photo/group-of-friends-walking-in-the-park-8121667/)                                                    |

Each of the ten categories now maps to a distinct photograph. The landing feature
has its own separate image, so no category photograph repeats on the homepage.
Category thumbnails and their destination community use consistent category artwork.

[Pexels license](https://www.pexels.com/license/): free use and modification are
permitted, subject to its restrictions. These are editorial illustrations of
connection, reflection, budgeting, study and nature. They never represent actual
members, testimonials, diagnoses or an endorsement. In particular, emotional
wellbeing uses a landscape rather than assigning a mental-health condition to a
recognizable person. Member profile pictures and story uploads remain separate.

`EditorialPhoto` provides descriptive alternative text, intrinsic dimensions,
local source paths, crop positions and lazy loading. Above-the-fold feature
photos load eagerly. The floating board respects reduced-motion preferences.

The profile summary uses only the signed-in owner's actual memberships and
accepted connections. Its counts are not exposed on anyone else's profile.
Fictional preview pages retain their existing visible preview label.
