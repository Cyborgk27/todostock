<?php

namespace App\Repositories;

use App\Models\Client;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ClientRepository
{
    public function getPaginated(string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Client::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'ilike', "%{$search}%")
                      ->orWhere('identification', 'like', "%{$search}%")
                      ->orWhere('email', 'ilike', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    public function findOrFail(int $id): Client
    {
        return Client::findOrFail($id);
    }

    public function create(array $data): Client
    {
        return Client::create($data);
    }

    public function update(Client $client, array $data): Client
    {
        $client->update($data);
        return $client;
    }

    public function delete(Client $client): bool
    {
        return $client->delete();
    }
}
