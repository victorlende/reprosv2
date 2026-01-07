<?php

namespace App\Mail;

use App\Models\EmailDestination;
use App\Models\Proccode;
use App\Models\ReconciliationSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ReconciliationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $submission;
    public $emailDestination;
    public $proccode;

    /**
     * Create a new message instance.
     */
    public function __construct(ReconciliationSubmission $submission, EmailDestination $emailDestination, ?Proccode $proccode = null)
    {
        $this->submission = $submission;
        $this->emailDestination = $emailDestination;
        $this->proccode = $proccode;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->submission->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reconciliation',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];
        foreach ($this->submission->files as $file) {
            $attachments[] = Attachment::fromStorageDisk('public', $file->file_path)
                ->as($file->file_name)
                ->withMime('text/plain');
        }
        return $attachments;
    }
}
