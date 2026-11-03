# AfterCall Ambassador review — HubSpot migration

Private preview: https://aftercall-ambassadors-review.vercel.app/ambassador-program

This folder preserves the actual v2 preview source, including its existing password gate. Deploy this directory to the existing `aftercall-ambassadors-review` Vercel project. No credentials are committed. The root ambassador-program.html is the same page for eventual website integration. Public main and the older /ambassadors route are not changed.

## HubSpot — AfterCall only

- Portal: 51892158.
- Form: `d1e9b435-4ef2-4593-bd7a-1cc8780d52e9`, AfterCall Ambassador Application — Spring 2027.
- Active segment 23: AfterCall — Ambassador Applicants — Spring 2027. Matches submissions of this exact form, on any page, at any time; not a static contact list.
- Team notifications: Nicolas, Jordan, Matt, Kim and Zach, selected from AfterCall's existing HubSpot users. Service accounts excluded.
- 22 application fields plus hidden `ambassador_application_status=Applied`; 15 dedicated ambassador properties created.
- Existing design, conditional student/provider fields, age and privacy/disclosure confirmations retained. Custom styled page submits through HubSpot's Forms API, so submissions are native HubSpot form events.
- No Mailchimp submissions or cross-portal routing. Existing EMS lead form left unchanged.
- New applicants are not automatically enrolled as marketing contacts. No applicant marketing email automation added.
- Success copy accurately promises team follow-up rather than claiming an automatic next-steps email already sent.
- Program terms unchanged; audience copy broadened to junior EMTs, EMS micro-influencers and students.

## Verification

- Chrome desktop 1440px and mobile 390px: no horizontal overflow.
- Mocked browser submissions: required fields, provider/student rules, consent/status mapping, success handling and API rejection handling pass.
- One explicitly marked INTERNAL QA identity used for verification on 2026-11-02. Two initial attempts were quarantined for an unregistered preview domain. Added and saved the exact preview domain in AfterCall tracking settings (spam protection unchanged), then retested from the deployed page. The page received HTTP success. This QA identity is not a real applicant and should not be counted in program reporting.
- Native notification recipient settings verified; inbox delivery is separate and must not be claimed solely from configuration or an accepted submission.

API documentation: https://developers.hubspot.com/docs/api-reference/legacy/marketing/forms/v3-legacy/submit-data-unauthenticated

## Final live verification

- Exact preview domain persisted after settings reload. HubSpot subsequently showed all three QA attempts as ordinary form submissions, with no spam submissions remaining in the form view.
- Deployed page submission verified in HubSpot: all supplied application data, both Yes confirmations, and Applied status stored. QA contact `259860398857` appeared in active segment 23 without manual list enrollment.
- There is one clearly labeled INTERNAL QA contact (three test attempts), not three applicants. It is a non-marketing contact. Inbox delivery to the five team recipients remains unverified.
- Live preview has broadened copy, an enabled submit button, exact AfterCall portal/form destination, and no remaining Mailchimp destination.
- GitHub PR: https://github.com/AfterCallApp/aftercall-website/pull/35 (targets campus-ambassadors-preview, not main).
