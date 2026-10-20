<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class JobseekerNotification extends Notification
{
    use Queueable;

    protected string $type;
    protected string $title;
    protected string $message;
    protected ?string $url;

    public function __construct(
        string $type,
        string $title,
        string $message,
        ?string $url = null
    ) {
        $this->type = $type;
        $this->title = $title;
        $this->message = $message;
        $this->url = $url;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
        ];
    }
}
