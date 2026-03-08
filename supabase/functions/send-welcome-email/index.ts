// supabase/functions/send-welcome-email/index.ts
// Deno Edge Function — sends welcome email + calendar invites

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const {
      personal_email, full_name, designation, department, start_date,
      office_location, reporting_manager, company_email, hr_email, it_email, aarf_token
    } = body

    const appUrl = Deno.env.get('APP_URL') || 'https://your-app.bolt.new'
    const aarfUrl = aarf_token ? `${appUrl}/aarf/${aarf_token}` : null

    const client = new SmtpClient()
    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(Deno.env.get('SMTP_PORT') || 587),
      username: Deno.env.get('SMTP_USER') || '',
      password: Deno.env.get('SMTP_PASS') || '',
    })

    const startDateFmt = start_date ? new Date(start_date).toLocaleDateString('en-MY', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : start_date

    // Welcome email to new hire
    if (personal_email) {
      await client.send({
        from: `Employee Portal <${Deno.env.get('SMTP_USER')}>`,
        to: personal_email,
        subject: 'Welcome to Claritas Asia — Your Onboarding Details',
        content: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
            <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px 30px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:22px">🎉 Welcome to Claritas Asia!</h1>
              <p style="color:rgba(255,255,255,.8);margin:6px 0 0;font-size:14px">We're excited to have you join the team</p>
            </div>
            <div style="padding:30px">
              <p style="font-size:18px;font-weight:600;color:#1e293b">Dear ${full_name},</p>
              <p style="color:#475569">We are delighted to welcome you to <strong>Claritas Asia Sdn. Bhd.</strong></p>
              <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0">
                <p style="margin:0 0 6px;font-size:14px"><strong>Position:</strong> ${designation}</p>
                <p style="margin:0 0 6px;font-size:14px"><strong>Department:</strong> ${department || '—'}</p>
                <p style="margin:0 0 6px;font-size:14px"><strong>Start Date:</strong> ${startDateFmt}</p>
                <p style="margin:0 0 6px;font-size:14px"><strong>Office:</strong> ${office_location}</p>
                <p style="margin:0 0 6px;font-size:14px"><strong>Reporting Manager:</strong> ${reporting_manager}</p>
                <p style="margin:0;font-size:14px"><strong>Work Email:</strong> ${company_email || '—'}</p>
              </div>
              ${aarfUrl ? `<p style="font-size:14px;color:#475569">Please review and acknowledge your <strong>Asset Acceptance Form (AARF)</strong>:</p>
              <p style="text-align:center;margin:20px 0"><a href="${aarfUrl}" style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">View & Acknowledge AARF →</a></p>` : ''}
              <p style="font-size:14px;color:#94a3b8">Questions? Contact HR at <strong>${hr_email}</strong> or IT at <strong>${it_email}</strong>.</p>
            </div>
            <div style="background:#f8fafc;padding:16px 30px;text-align:center;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} Claritas Asia Sdn. Bhd.</div>
          </div>`,
        html: true,
      })
    }

    // Calendar invite to HR
    if (hr_email && start_date) {
      const dtStart = start_date.replace(/-/g, '') + 'T090000'
      const dtEnd   = start_date.replace(/-/g, '') + 'T100000'
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Employee Portal//EN', 'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
        `SUMMARY:New Hire Onboarding — ${full_name}`,
        `DESCRIPTION:New hire ${full_name} (${designation}) starts on ${start_date}. Please ensure all preparations are ready.`,
        `ORGANIZER:mailto:${Deno.env.get('SMTP_USER')}`,
        `ATTENDEE;RSVP=TRUE:mailto:${hr_email}`,
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n')

      await client.send({
        from: `Employee Portal <${Deno.env.get('SMTP_USER')}>`,
        to: hr_email,
        subject: `New Hire Onboarding — ${full_name} — ${start_date}`,
        content: `New hire onboarding scheduled. ${full_name} (${designation}) starts on ${start_date}.`,
        attachments: [{ filename: 'onboarding.ics', content: new TextEncoder().encode(ics), contentType: 'text/calendar' }],
      })
    }

    // Calendar invite to IT
    if (it_email && start_date && it_email !== hr_email) {
      const dtStart = start_date.replace(/-/g, '') + 'T090000'
      const dtEnd   = start_date.replace(/-/g, '') + 'T100000'
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Employee Portal//EN', 'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
        `SUMMARY:IT Prep — New Hire ${full_name}`,
        `DESCRIPTION:IT needs to prepare assets and setup for ${full_name} (${designation}) starting ${start_date}.`,
        `ORGANIZER:mailto:${Deno.env.get('SMTP_USER')}`,
        `ATTENDEE;RSVP=TRUE:mailto:${it_email}`,
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n')

      await client.send({
        from: `Employee Portal <${Deno.env.get('SMTP_USER')}>`,
        to: it_email,
        subject: `IT Prep — New Hire ${full_name} — ${start_date}`,
        content: `IT setup required for ${full_name} (${designation}) starting ${start_date}.`,
        attachments: [{ filename: 'it-prep.ics', content: new TextEncoder().encode(ics), contentType: 'text/calendar' }],
      })
    }

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Email error:', err)
    // Don't fail silently — but don't block the onboarding either
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 200, // Return 200 so frontend doesn't error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
