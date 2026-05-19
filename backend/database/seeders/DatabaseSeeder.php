<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin Todotek',
            'email' => 'admin@todotek.com',
            'password' => bcrypt('password123'),
        ]);

        $this->call([
            ClientSeeder::class,
            ProductSeeder::class,
            InvoiceSeeder::class,
        ]);
    }
}
