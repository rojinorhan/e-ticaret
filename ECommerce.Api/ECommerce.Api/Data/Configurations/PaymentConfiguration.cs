
using ECommerce.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Api.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.CardHolderName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.MaskedCardNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.Amount)
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.PaymentStatus)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(p => p.TransactionId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.PaymentDate)
            .IsRequired();

        builder.HasOne<Order>()
            .WithMany()
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
