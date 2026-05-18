<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendChatMessageRequest;
use App\Models\ChatConversation;
use Illuminate\Http\Request;

class ChatSupportController extends Controller
{
    public function userMessages(Request $request)
    {
        $conversation = ChatConversation::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'data' => [
                'conversation' => $conversation->load('user'),
                'messages' => $conversation->messages()
                    ->with('sender:id,name,email')
                    ->oldest()
                    ->get(),
            ],
        ]);
    }

    public function userSend(SendChatMessageRequest $request)
    {
        $conversation = ChatConversation::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'sender_type' => 'user',
            'message' => $request->validated()['message'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'data' => $message->load('sender:id,name,email'),
        ], 201);
    }

    public function adminConversations()
    {
        $conversations = ChatConversation::query()
            ->with(['user:id,name,email,phone', 'latestMessage.sender:id,name,email'])
            ->withCount([
                'messages as unread_count' => fn($q) => $q
                    ->where('sender_type', 'user')
                    ->whereNull('read_at'),
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $conversations]);
    }

    public function adminMessages(ChatConversation $conversation)
    {
        $conversation->messages()
            ->where('sender_type', 'user')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'data' => [
                'conversation' => $conversation->load('user:id,name,email,phone'),
                'messages' => $conversation->messages()
                    ->with('sender:id,name,email')
                    ->oldest()
                    ->get(),
            ],
        ]);
    }

    public function adminSend(SendChatMessageRequest $request, ChatConversation $conversation)
    {
        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'sender_type' => 'admin',
            'message' => $request->validated()['message'],
            'read_at' => now(),
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'data' => $message->load('sender:id,name,email'),
        ], 201);
    }
}
