using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.Role)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.IsLocked)
            .IsRequired();

        builder.Property(u => u.LockReason)
            .HasMaxLength(500);

        builder.OwnsOne(u => u.DefaultAddress, a =>
        {
            a.Property(ad => ad.Street).HasColumnName("DefaultStreet").HasMaxLength(250);
            a.Property(ad => ad.City).HasColumnName("DefaultCity").HasMaxLength(100);
            a.Property(ad => ad.PostalCode).HasColumnName("DefaultPostalCode").HasMaxLength(20);
            a.Property(ad => ad.Country).HasColumnName("DefaultCountry").HasMaxLength(100);
        });
    }
}
